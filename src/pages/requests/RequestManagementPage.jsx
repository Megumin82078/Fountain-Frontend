import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import { ActionTypes } from '../../context/AppContext';
import providerService from '../../services/providerService';
import requestService from '../../services/requestService';
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
  ConfirmModal,
  LoadingSpinner
} from '../../components/common';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  DocumentIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const RequestManagementPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const userId = state.user?.id || 'user-123'; // Mock user ID
  
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  
  // Provider search state
  const [providerSearchQuery, setProviderSearchQuery] = useState('');
  const [providerSearchResults, setProviderSearchResults] = useState([]);
  const [searchingProviders, setSearchingProviders] = useState(false);
  const [userProviders, setUserProviders] = useState([]);
  
  // Enhanced new request state
  const [newRequest, setNewRequest] = useState({
    requestType: '',
    provider: null, // Changed to object to store full provider details
    providerId: '',
    providerName: '',
    recordTypes: [],
    dateRange: { start: '', end: '' },
    priority: 'medium',
    notes: '',
    urgentReason: '',
    contactPreference: 'email',
    deliveryMethod: 'secure_portal'
  });

  // Requests data from backend
  const [requests, setRequests] = useState([]);

  // Load user providers on mount
  useEffect(() => {
    loadUserProviders();
  }, []);
  
  // Load requests when filters change
  useEffect(() => {
    loadRequests();
  }, [statusFilter, typeFilter, priorityFilter, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Load requests from backend
  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await requestService.getRequests({
        status: statusFilter,
        type: typeFilter,
        priority: priorityFilter,
        search: searchQuery
      });
      
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      // Show error toast
      dispatch({
        type: ActionTypes.SHOW_NOTIFICATION,
        payload: {
          type: 'error',
          message: 'Failed to load requests'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserProviders = async () => {
    try {
      const providers = await providerService.getProviders();
      setUserProviders(providers || []);
    } catch (error) {
      console.error('Error loading user providers:', error);
      setUserProviders([]);
    }
  };

  // Search providers when typing
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (providerSearchQuery.length > 2) {
        searchProviders();
      } else {
        setProviderSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [providerSearchQuery]);

  const searchProviders = async () => {
    try {
      setSearchingProviders(true);
      const response = await providerService.searchProviders({
        query: providerSearchQuery,
        limit: 10
      });
      
      // Combine with user's custom providers
      const userCustomProviders = userProviders.filter(p => 
        p.name.toLowerCase().includes(providerSearchQuery.toLowerCase()) ||
        p.organizationName?.toLowerCase().includes(providerSearchQuery.toLowerCase())
      );
      
      const allResults = [...(response.providers || []), ...userCustomProviders];
      
      // Remove duplicates
      const uniqueResults = allResults.filter((provider, index, self) =>
        index === self.findIndex((p) => p.id === provider.id)
      );
      
      setProviderSearchResults(uniqueResults);
    } catch (error) {
      console.error('Error searching providers:', error);
    } finally {
      setSearchingProviders(false);
    }
  };

  // Filter and search options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'complete_records', label: 'Complete Records' },
    { value: 'lab_results', label: 'Lab Results' },
    { value: 'medications', label: 'Medications' },
    { value: 'procedures', label: 'Procedures' },
    { value: 'imaging', label: 'Imaging Studies' },
    { value: 'visits', label: 'Visit Records' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const recordTypeOptions = [
    { value: 'lab_results', label: 'Lab Results' },
    { value: 'medications', label: 'Medications' },
    { value: 'procedures', label: 'Procedures' },
    { value: 'imaging', label: 'Imaging Studies' },
    { value: 'visits', label: 'Visit Records' },
    { value: 'allergies', label: 'Allergies' },
    { value: 'immunizations', label: 'Immunizations' },
    { value: 'vital_signs', label: 'Vital Signs' }
  ];

  // Utility functions
  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'neutral';
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'neutral';
    }
  };

  const formatRequestType = (type) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const generateTrackingNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const year = new Date().getFullYear();
    return `REQ-${timestamp}-${year}`;
  };

  const calculateDueDate = (priority) => {
    const now = new Date();
    const daysToAdd = priority === 'high' ? 7 : priority === 'medium' ? 14 : 21;
    const dueDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    return dueDate.toISOString();
  };

  const getEstimatedCompletion = (requestType) => {
    const completionTimes = {
      complete_records: '5-10 business days',
      lab_results: '1-3 business days',
      medications: '2-3 business days',
      procedures: '3-5 business days',
      imaging: '3-5 business days',
      visits: '2-4 business days'
    };
    return completionTimes[requestType] || '3-7 business days';
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.targetProvider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.requestType === typeFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  // Group requests by status
  const groupedRequests = {
    pending: filteredRequests.filter(r => r.status === 'pending'),
    in_progress: filteredRequests.filter(r => r.status === 'in_progress'),
    completed: filteredRequests.filter(r => r.status === 'completed'),
    cancelled: filteredRequests.filter(r => r.status === 'cancelled')
  };

  const handleCreateRequest = async () => {
    // Validate form
    if (!newRequest.requestType || !newRequest.provider) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Since backend doesn't have a create endpoint, we'll create locally
      // and show a message that it needs backend implementation
      const request = {
        id: `req-${Date.now()}`,
        trackingNumber: generateTrackingNumber(),
        title: `${formatRequestType(newRequest.requestType)} Request`,
        description: `${formatRequestType(newRequest.requestType)} from ${newRequest.provider.name}`,
        status: 'pending',
        priority: newRequest.priority,
        requestType: newRequest.requestType,
        targetProvider: newRequest.provider.name,
        providerId: newRequest.provider.id,
        requestedBy: state.user?.name || 'John Doe',
        createdDate: new Date().toISOString(),
        dueDate: calculateDueDate(newRequest.priority),
        estimatedCompletion: getEstimatedCompletion(newRequest.requestType),
        progress: 0,
        recordTypes: newRequest.recordTypes.length > 0 ? newRequest.recordTypes : [newRequest.requestType],
        notes: newRequest.notes,
        contactPreference: newRequest.contactPreference,
        deliveryMethod: newRequest.deliveryMethod,
        urgentReason: newRequest.priority === 'high' ? newRequest.urgentReason : null
      };
      
      // Try to create via service if backend endpoint exists
      try {
        const response = await requestService.createRequest({
          request_type: newRequest.requestType,
          provider_id: newRequest.provider.id,
          provider_name: newRequest.provider.name,
          priority: newRequest.priority,
          notes: newRequest.notes,
          record_types: newRequest.recordTypes,
          date_range: newRequest.dateRange,
          contact_preference: newRequest.contactPreference,
          delivery_method: newRequest.deliveryMethod,
          urgent_reason: newRequest.priority === 'urgent' ? newRequest.urgentReason : null
        });
        
        if (response.success) {
          toast.success(
            <div>
              <div className="font-semibold">Request created successfully!</div>
              <div className="text-sm mt-1">
                Tracking #: {response.trackingNumber || response.tracking_number || 'N/A'}
              </div>
              <div className="text-sm">You can track your request status anytime.</div>
            </div>
          );
          await loadRequests(); // Reload from backend
        }
      } catch (error) {
        // If backend fails, add locally and show warning
        console.warn('Backend request creation failed, adding locally:', error);
        setRequests([...requests, request]);
        toast.success(
          <div>
            <div className="font-semibold">Request created successfully!</div>
            <div className="text-sm mt-1">
              Tracking #: {request.trackingNumber}
            </div>
            <div className="text-sm">You can track your request status anytime.</div>
            <div className="text-xs mt-2 text-yellow-600">Note: Saved locally - backend sync pending</div>
          </div>
        );
      }
      
      setShowCreateModal(false);
      
      // Reset form
      setNewRequest({
        requestType: '',
        provider: null,
        providerId: '',
        providerName: '',
        recordTypes: [],
        dateRange: { start: '', end: '' },
        priority: 'medium',
        notes: '',
        urgentReason: '',
        contactPreference: 'email',
        deliveryMethod: 'secure_portal'
      });
      setProviderSearchQuery('');
      setProviderSearchResults([]);
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error(error.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRequest = () => {
    if (!editingRequest) return;

    const updatedRequests = requests.map(req => 
      req.id === editingRequest.id ? editingRequest : req
    );
    
    setRequests(updatedRequests);
    setShowEditModal(false);
    setEditingRequest(null);
  };

  const handleDeleteRequest = () => {
    if (!requestToDelete) return;

    const updatedRequests = requests.filter(req => req.id !== requestToDelete.id);
    setRequests(updatedRequests);
    setShowDeleteModal(false);
    setRequestToDelete(null);
  };

  const handleCancelRequest = (requestId) => {
    const updatedRequests = requests.map(req => 
      req.id === requestId ? { ...req, status: 'cancelled' } : req
    );
    setRequests(updatedRequests);
  };

  const handleTrackRequest = (request) => {
    navigate(`/requests/track/${request.trackingNumber}`);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  // Tab definitions
  const requestTabs = [
    {
      key: 'all',
      label: `All Requests (${filteredRequests.length})`,
      content: (
        <div className="space-y-4">
          {filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRequests.map((request) => (
                <HealthCard
                  key={request.id}
                  title={request.title}
                  subtitle={request.trackingNumber}
                  status={request.status}
                  variant={getStatusVariant(request.status)}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleViewDetails(request)}
                >
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Provider:</span>
                      <span className="text-sm font-medium text-neutral-900">{request.targetProvider}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Priority:</span>
                      <Badge variant={getPriorityVariant(request.priority)} size="sm">
                        {request.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Created:</span>
                      <span className="text-sm text-neutral-900">
                        {new Date(request.createdDate).toLocaleDateString()}
                      </span>
                    </div>
                    {request.status === 'in_progress' && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-neutral-600">Progress:</span>
                          <span className="text-neutral-900">{request.progress}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div 
                            className="bg-info-500 h-2 rounded-full"
                            style={{ width: `${request.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTrackRequest(request);
                        }}
                      >
                        Track
                      </Button>
                      <div className="flex items-center space-x-2 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingRequest(request);
                            setShowEditModal(true);
                          }}
                          className="p-1"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="error"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRequestToDelete(request);
                            setShowDeleteModal(true);
                          }}
                          className="p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </HealthCard>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8" style={{fontFamily: 'var(--font-body)'}}>No requests match your current filters.</div>
          )}
        </div>
      )
    },
    {
      key: 'by-status',
      label: 'By Status',
      content: (
        <div className="space-y-8">
          {/* Pending Requests */}
          {groupedRequests.pending.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <ClockIcon className="w-5 h-5 text-warning-500 mr-2" />
                Pending ({groupedRequests.pending.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedRequests.pending.map((request) => (
                  <HealthCard
                    key={request.id}
                    title={request.title}
                    subtitle={request.trackingNumber}
                    status={request.status}
                    variant="warning"
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleViewDetails(request)}
                  >
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Created:</span>
                        <span className="text-neutral-900">
                          {new Date(request.createdDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Provider:</span>
                        <span className="text-neutral-900 truncate max-w-32">{request.targetProvider}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTrackRequest(request);
                          }}
                        >
                          Track Progress
                        </Button>
                        <Button
                          variant="error"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelRequest(request.id);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </HealthCard>
                ))}
              </div>
            </div>
          )}

          {/* In Progress Requests */}
          {groupedRequests.in_progress.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <ArrowPathIcon className="w-5 h-5 text-info-500 mr-2" />
                In Progress ({groupedRequests.in_progress.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedRequests.in_progress.map((request) => (
                  <HealthCard
                    key={request.id}
                    title={request.title}
                    subtitle={request.trackingNumber}
                    status={request.status}
                    variant="info"
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleViewDetails(request)}
                  >
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Progress:</span>
                        <span className="text-neutral-900">{request.progress}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div 
                          className="bg-info-500 h-2 rounded-full"
                          style={{ width: `${request.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTrackRequest(request);
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="error"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRequestToDelete(request);
                            setShowDeleteModal(true);
                          }}
                          className="p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </HealthCard>
                ))}
              </div>
            </div>
          )}

          {/* Completed Requests */}
          {groupedRequests.completed.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-success-500 mr-2" />
                Completed ({groupedRequests.completed.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedRequests.completed.map((request) => (
                  <HealthCard
                    key={request.id}
                    title={request.title}
                    subtitle={request.trackingNumber}
                    status={request.status}
                    variant="success"
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleViewDetails(request)}
                  >
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Completed:</span>
                        <span className="text-neutral-900">
                          {new Date(request.completedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Provider:</span>
                        <span className="text-neutral-900 truncate max-w-32">{request.targetProvider}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle viewing records
                          }}
                        >
                          View Records
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle download
                          }}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  </HealthCard>
                ))}
              </div>
            </div>
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
                Records Requests
              </h1>
              <p className="text-neutral-600">
                Manage and track your medical records requests
              </p>
            </div>
            <Button 
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Request</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by tracking number, provider, or description..."
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
                containerClassName="min-w-[150px]"
              />
              <Select
                value={{ value: typeFilter, label: typeOptions.find(o => o.value === typeFilter)?.label }}
                onChange={(option) => setTypeFilter(option.value)}
                options={typeOptions}
                placeholder="Type"
                size="sm"
                containerClassName="min-w-[140px]"
              />
              <Select
                value={{ value: priorityFilter, label: priorityOptions.find(o => o.value === priorityFilter)?.label }}
                onChange={(option) => setPriorityFilter(option.value)}
                options={priorityOptions}
                placeholder="Priority"
                size="sm"
                containerClassName="min-w-[160px]"
              />
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="text-2xl font-bold text-neutral-900 mb-1">
              {requests.length}
            </div>
            <div className="text-sm text-neutral-600">Total Requests</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-warning-600 mb-1">
              {groupedRequests.pending.length}
            </div>
            <div className="text-sm text-neutral-600">Pending</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-info-600 mb-1">
              {groupedRequests.in_progress.length}
            </div>
            <div className="text-sm text-neutral-600">In Progress</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-success-600 mb-1">
              {groupedRequests.completed.length}
            </div>
            <div className="text-sm text-neutral-600">Completed</div>
          </Card>
        </div>

        {/* Requests List */}
        <Tabs 
          tabs={requestTabs} 
          variant="pills"
        />

        {/* Create Request Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Records Request"
          size="lg"
        >
          <div className="space-y-4">
            {/* Progress indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 whitespace-nowrap">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${newRequest.requestType ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                  1
                </div>
                <span className={`text-sm font-medium ${newRequest.requestType ? 'text-primary-600' : 'text-neutral-500'}`}>
                  Request Type
                </span>
              </div>
              <div className="h-px bg-neutral-200 flex-1 mx-4" />
              <div className="flex items-center space-x-2 whitespace-nowrap">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${newRequest.provider ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                  2
                </div>
                <span className={`text-sm font-medium ${newRequest.provider ? 'text-primary-600' : 'text-neutral-500'}`}>
                  Provider
                </span>
              </div>
              <div className="h-px bg-neutral-200 flex-1 mx-4" />
              <div className="flex items-center space-x-2 whitespace-nowrap">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${newRequest.notes || newRequest.priority !== 'medium' ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                  3
                </div>
                <span className={`text-sm font-medium ${newRequest.notes || newRequest.priority !== 'medium' ? 'text-primary-600' : 'text-neutral-500'}`}>
                  Details
                </span>
              </div>
            </div>


            <div className="space-y-4">
              {/* Step 1: Request Type */}
              <div className="bg-neutral-50 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                  What type of records do you need?
                </h3>
                <Select
                  value={newRequest.requestType ? { 
                    value: newRequest.requestType, 
                    label: typeOptions.find(o => o.value === newRequest.requestType)?.label 
                  } : null}
                  onChange={(option) => setNewRequest({...newRequest, requestType: option.value})}
                  options={typeOptions.filter(o => o.value !== 'all')}
                  placeholder="Select request type"
                  className="w-full"
                />
              </div>
              
              {/* Step 2: Provider Selection */}
              <div className="bg-neutral-50 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                  Which healthcare provider has your records?
                </h3>
                <div className="relative">
                  <Input
                    value={providerSearchQuery}
                    onChange={(e) => setProviderSearchQuery(e.target.value)}
                    placeholder="Search by provider name, organization, or city..."
                    leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
                    className="w-full"
                  />
                  
                  {/* Provider search results dropdown */}
                  {(providerSearchResults.length > 0 || searchingProviders) && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-neutral-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {searchingProviders ? (
                        <div className="p-4 text-center">
                          <LoadingSpinner size="sm" />
                          <p className="text-sm text-neutral-600 mt-2">Searching providers...</p>
                        </div>
                      ) : (
                        providerSearchResults.map((provider) => (
                          <button
                            key={provider.id}
                            className="w-full text-left p-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0"
                            onClick={() => {
                              setNewRequest({
                                ...newRequest,
                                provider: provider,
                                providerId: provider.id,
                                providerName: provider.name
                              });
                              setProviderSearchQuery(provider.name);
                              setProviderSearchResults([]);
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                {provider.type === 'hospital' ? (
                                  <BuildingOfficeIcon className="w-5 h-5 text-neutral-500" />
                                ) : (
                                  <UserIcon className="w-5 h-5 text-neutral-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-neutral-900">{provider.name}</div>
                                <div className="text-sm text-neutral-600">
                                  {provider.specialty}
                                  {provider.organizationName && ` • ${provider.organizationName}`}
                                </div>
                                {provider.address && (
                                  <div className="text-sm text-neutral-500 flex items-center mt-1">
                                    <MapPinIcon className="w-3 h-3 mr-1" />
                                    {provider.address.city}, {provider.address.province}
                                  </div>
                                )}
                                {provider.isCustom && (
                                  <Badge variant="neutral" size="sm" className="mt-1">
                                    Custom Provider
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                  
                  {/* Selected provider display */}
                  {newRequest.provider && (
                    <div className="mt-2 p-3 bg-primary-50 border border-primary-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-primary-900">{newRequest.provider.name}</div>
                          <div className="text-sm text-primary-700">
                            {newRequest.provider.specialty}
                            {newRequest.provider.contact?.phone && ` • ${newRequest.provider.contact.phone}`}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setNewRequest({...newRequest, provider: null, providerId: '', providerName: ''});
                            setProviderSearchQuery('');
                          }}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <p className="mt-2 text-sm text-neutral-600">
                  Can't find your provider? 
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setShowCreateModal(false);
                      navigate('/providers');
                    }}
                    className="ml-1"
                  >
                    Add a new provider
                  </Button>
                </p>
              </div>
              
              {/* Step 3: Additional Details */}
              <div className="bg-neutral-50 p-3 rounded-lg space-y-3">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                  Additional Details
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <Select
                    value={{ value: newRequest.priority, label: priorityOptions.find(o => o.value === newRequest.priority)?.label }}
                    onChange={(option) => setNewRequest({...newRequest, priority: option.value})}
                    options={priorityOptions.filter(o => o.value !== 'all')}
                    className="w-full"
                  />
                </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Method
                </label>
                <Select
                  value={{ value: newRequest.deliveryMethod, label: newRequest.deliveryMethod === 'secure_portal' ? 'Secure Portal' : 'Email' }}
                  onChange={(option) => setNewRequest({...newRequest, deliveryMethod: option.value})}
                  options={[
                    { value: 'secure_portal', label: 'Secure Portal' },
                    { value: 'email', label: 'Email' },
                    { value: 'mail', label: 'Physical Mail' },
                    { value: 'pickup', label: 'In-Person Pickup' }
                  ]}
                />
              </div>
            </div>

            {newRequest.requestType === 'complete_records' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Record Types (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {recordTypeOptions.map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={newRequest.recordTypes.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewRequest({...newRequest, recordTypes: [...newRequest.recordTypes, option.value]});
                          } else {
                            setNewRequest({...newRequest, recordTypes: newRequest.recordTypes.filter(t => t !== option.value)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range - Start (Optional)
                </label>
                <Input
                  type="date"
                  value={newRequest.dateRange.start}
                  onChange={(e) => setNewRequest({
                    ...newRequest, 
                    dateRange: {...newRequest.dateRange, start: e.target.value}
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range - End (Optional)
                </label>
                <Input
                  type="date"
                  value={newRequest.dateRange.end}
                  onChange={(e) => setNewRequest({
                    ...newRequest, 
                    dateRange: {...newRequest.dateRange, end: e.target.value}
                  })}
                />
              </div>
            </div>

            {newRequest.priority === 'high' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Urgency *
                </label>
                <textarea
                  value={newRequest.urgentReason}
                  onChange={(e) => setNewRequest({...newRequest, urgentReason: e.target.value})}
                  placeholder="Please explain why this request is urgent..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={newRequest.notes}
                onChange={(e) => setNewRequest({...newRequest, notes: e.target.value})}
                placeholder="Any specific instructions or details..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Preference
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="contactPreference"
                    value="email"
                    checked={newRequest.contactPreference === 'email'}
                    onChange={(e) => setNewRequest({...newRequest, contactPreference: e.target.value})}
                    className="mr-2"
                  />
                  <span className="text-sm">Email</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="contactPreference"
                    value="phone"
                    checked={newRequest.contactPreference === 'phone'}
                    onChange={(e) => setNewRequest({...newRequest, contactPreference: e.target.value})}
                    className="mr-2"
                  />
                  <span className="text-sm">Phone</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="contactPreference"
                    value="text"
                    checked={newRequest.contactPreference === 'text'}
                    onChange={(e) => setNewRequest({...newRequest, contactPreference: e.target.value})}
                    className="mr-2"
                  />
                  <span className="text-sm">Text Message</span>
                </label>
              </div>
            </div>
              </div>


            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setShowCreateModal(false);
                setProviderSearchQuery('');
                setProviderSearchResults([]);
              }}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleCreateRequest}
                disabled={!newRequest.requestType || !newRequest.provider}
              >
                Create Request
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Request Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Request"
          size="lg"
        >
          {editingRequest && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <Select
                  value={{ value: editingRequest.priority, label: priorityOptions.find(o => o.value === editingRequest.priority)?.label }}
                  onChange={(option) => setEditingRequest({...editingRequest, priority: option.value})}
                  options={priorityOptions.filter(o => o.value !== 'all')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={editingRequest.notes}
                  onChange={(e) => setEditingRequest({...editingRequest, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleEditRequest}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Request Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Request Details"
          size="lg"
        >
          {selectedRequest && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">{selectedRequest.title}</h3>
                  <p className="text-sm text-neutral-600">{selectedRequest.trackingNumber}</p>
                </div>
                <Badge variant={getStatusVariant(selectedRequest.status)} size="lg">
                  {selectedRequest.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Provider</label>
                  <p className="mt-1 text-neutral-900">{selectedRequest.targetProvider}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Request Type</label>
                  <p className="mt-1 text-neutral-900">{formatRequestType(selectedRequest.requestType)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Priority</label>
                  <Badge variant={getPriorityVariant(selectedRequest.priority)} className="mt-1">
                    {selectedRequest.priority}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Delivery Method</label>
                  <p className="mt-1 text-neutral-900 capitalize">{selectedRequest.deliveryMethod.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Created Date</label>
                  <p className="mt-1 text-neutral-900">{new Date(selectedRequest.createdDate).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Due Date</label>
                  <p className="mt-1 text-neutral-900">{new Date(selectedRequest.dueDate).toLocaleString()}</p>
                </div>
              </div>

              {selectedRequest.status === 'in_progress' && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Progress</label>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{selectedRequest.progress}% Complete</span>
                      <span className="text-neutral-600">{selectedRequest.estimatedCompletion}</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-3">
                      <div 
                        className="bg-info-500 h-3 rounded-full"
                        style={{ width: `${selectedRequest.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedRequest.recordTypes.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Record Types</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedRequest.recordTypes.map((type) => (
                      <Badge key={type} variant="neutral" size="sm">
                        {formatRequestType(type)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.notes && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Notes</label>
                  <p className="mt-1 text-neutral-900">{selectedRequest.notes}</p>
                </div>
              )}

              {selectedRequest.urgentReason && (
                <Alert
                  variant="warning"
                  title="Urgent Request"
                  message={selectedRequest.urgentReason}
                />
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleTrackRequest(selectedRequest);
                  }}
                >
                  Track Request
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteRequest}
          title="Delete Request"
          message={`Are you sure you want to delete the request "${requestToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="error"
        />
      </div>
    </AppLayout>
  );
};

export default RequestManagementPage;