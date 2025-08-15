import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import toast from '../../utils/toast';
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
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ProceduresPage = () => {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [procedures, setProcedures] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newProcedure, setNewProcedure] = useState({
    name: '',
    description: '',
    type: 'diagnostic',
    status: 'scheduled',
    date: new Date().toISOString().split('T')[0],
    time: '',
    location: '',
    provider: '',
    duration: '',
    outcome: '',
    notes: '',
    attachments: []
  });

  // Fetch procedures from backend on mount
  useEffect(() => {
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    setLoading(true);
    try {
      const data = await apiService.getProcedures();
      const formattedProcedures = Array.isArray(data) ? data.map(proc => ({
        ...proc,
        name: proc.label || proc.fact?.name || 'Unknown Procedure',
        description: proc.notes || proc.fact?.description || '',
        type: proc.fact?.type || 'diagnostic',
        status: proc.status || 'completed',
        date: proc.date || proc.performed_date,
        location: proc.location || '',
        provider: proc.provider || '',
        outcome: proc.outcome || '',
        attachments: proc.attachments || []
      })) : [];
      setProcedures(formattedProcedures);
      // Also update global state for consistency
      dispatch({
        type: 'SET_PROCEDURES',
        payload: formattedProcedures
      });
    } catch (error) {
      console.error('Failed to fetch procedures:', error);
      toast.error('Failed to load procedures. Using local data.');
      // Fall back to local state if backend fails
      setProcedures(state.healthData.procedures || []);
    } finally {
      setLoading(false);
    }
  };

  // Filter procedures
  const filteredProcedures = procedures.filter(procedure => {
    const matchesSearch = procedure.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      procedure.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || procedure.status === statusFilter;
    const matchesType = typeFilter === 'all' || procedure.type === typeFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const procedureDate = new Date(procedure.date);
      const now = new Date();
      const daysDiff = (now - procedureDate) / (1000 * 60 * 60 * 24);
      
      switch (dateFilter) {
        case '30days':
          matchesDate = daysDiff <= 30;
          break;
        case '90days':
          matchesDate = daysDiff <= 90;
          break;
        case '1year':
          matchesDate = daysDiff <= 365;
          break;
        case '2years':
          matchesDate = daysDiff <= 730;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  // Group procedures by status
  const groupedProcedures = {
    completed: filteredProcedures.filter(p => p.status === 'completed'),
    scheduled: filteredProcedures.filter(p => p.status === 'scheduled'),
    cancelled: filteredProcedures.filter(p => p.status === 'cancelled'),
    pending: filteredProcedures.filter(p => p.status === 'pending')
  };

  // Group by type
  const groupedByType = filteredProcedures.reduce((acc, procedure) => {
    const type = procedure.type || 'Other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(procedure);
    return acc;
  }, {});

  // Sort procedures by date (newest first)
  const sortedProcedures = [...filteredProcedures].sort((a, b) => new Date(b.date) - new Date(a.date));

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'diagnostic', label: 'Diagnostic' },
    { value: 'therapeutic', label: 'Therapeutic' },
    { value: 'surgical', label: 'Surgical' },
    { value: 'preventive', label: 'Preventive' },
    { value: 'emergency', label: 'Emergency' }
  ];

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 3 Months' },
    { value: '1year', label: 'Last Year' },
    { value: '2years', label: 'Last 2 Years' }
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'scheduled': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTypeVariant = (type) => {
    switch (type) {
      case 'surgical': return 'error';
      case 'diagnostic': return 'info';
      case 'therapeutic': return 'success';
      case 'preventive': return 'primary';
      case 'emergency': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'scheduled': return <CalendarIcon className="w-4 h-4" />;
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'cancelled': return <span className="w-4 h-4">❌</span>;
      default: return <ClipboardDocumentListIcon className="w-4 h-4" />;
    }
  };

  const formatProcedureType = (type) => {
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Other';
  };

  const handleViewDetails = (procedure) => {
    setSelectedProcedure(procedure);
    setShowDetailsModal(true);
  };

  const handleAddProcedure = () => {
    setNewProcedure({
      name: '',
      description: '',
      type: 'diagnostic',
      status: 'scheduled',
      date: new Date().toISOString().split('T')[0],
      time: '',
      location: '',
      provider: '',
      duration: '',
      outcome: '',
      notes: '',
      attachments: []
    });
    setShowAddModal(true);
  };

  const handleSaveProcedure = async () => {
    if (!newProcedure.name.trim()) {
      toast.error('Please enter a procedure name');
      return;
    }

    setLoading(true);
    try {
      // Convert to backend format
      const procedureData = {
        fact_id: 'proc-' + Date.now(), // Temporary fact_id until we have procedure facts
        label: newProcedure.name,
        date: newProcedure.time ? `${newProcedure.date}T${newProcedure.time}:00.000Z` : `${newProcedure.date}T00:00:00.000Z`,
        notes: newProcedure.notes || null
      };

      const createdProcedure = await apiService.createProcedure(procedureData);
      
      // Format for frontend
      const procedureToAdd = {
        ...createdProcedure,
        name: createdProcedure.label,
        description: newProcedure.description,
        type: newProcedure.type,
        status: newProcedure.status,
        location: newProcedure.location,
        provider: newProcedure.provider,
        duration: newProcedure.duration,
        outcome: newProcedure.outcome,
        attachments: newProcedure.attachments
      };
      
      setProcedures(prev => [...prev, procedureToAdd]);
      dispatch({
        type: 'ADD_PROCEDURE',
        payload: procedureToAdd
      });

      setShowAddModal(false);
      toast.success('Procedure added successfully!');
      
      // Reset form
      setNewProcedure({
        name: '',
        description: '',
        type: 'diagnostic',
        status: 'scheduled',
        date: new Date().toISOString().split('T')[0],
        time: '',
        location: '',
        provider: '',
        duration: '',
        outcome: '',
        notes: '',
        attachments: []
      });
    } catch (error) {
      console.error('Failed to create procedure:', error);
      toast.error('Failed to add procedure. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProcedure = (procedure) => {
    const procedureDate = new Date(procedure.date);
    setEditingProcedure({
      ...procedure,
      date: procedureDate.toISOString().split('T')[0],
      time: procedureDate.toTimeString().split(' ')[0].substring(0, 5)
    });
    setShowEditModal(true);
    setShowDetailsModal(false);
  };

  const handleUpdateProcedure = async () => {
    if (!editingProcedure.name.trim()) {
      toast.error('Please enter a procedure name');
      return;
    }

    setLoading(true);
    try {
      // Convert to backend format
      const updateData = {
        label: editingProcedure.name,
        date: editingProcedure.time ? `${editingProcedure.date}T${editingProcedure.time}:00.000Z` : `${editingProcedure.date}T00:00:00.000Z`,
        notes: editingProcedure.notes || null
      };

      const updatedProcedure = await apiService.updateProcedure(editingProcedure.id, updateData);
      
      // Format for frontend
      const formattedProcedure = {
        ...updatedProcedure,
        name: updatedProcedure.label,
        description: editingProcedure.description,
        type: editingProcedure.type,
        status: editingProcedure.status,
        location: editingProcedure.location,
        provider: editingProcedure.provider,
        duration: editingProcedure.duration,
        outcome: editingProcedure.outcome,
        attachments: editingProcedure.attachments
      };
      
      setProcedures(prev => prev.map(proc => 
        proc.id === editingProcedure.id ? formattedProcedure : proc
      ));
      dispatch({
        type: 'EDIT_PROCEDURE',
        payload: formattedProcedure
      });

      setShowEditModal(false);
      setEditingProcedure(null);
      toast.success('Procedure updated successfully!');
    } catch (error) {
      console.error('Failed to update procedure:', error);
      toast.error('Failed to update procedure. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProcedure = async (procedureId) => {
    if (window.confirm('Are you sure you want to delete this procedure?')) {
      setLoading(true);
      try {
        await apiService.deleteProcedure(procedureId);
        
        // Update local state
        setProcedures(prev => prev.filter(proc => proc.id !== procedureId));
        dispatch({
          type: 'DELETE_PROCEDURE',
          payload: procedureId
        });
        
        setShowDetailsModal(false);
        toast.success('Procedure deleted successfully!');
      } catch (error) {
        console.error('Failed to delete procedure:', error);
        toast.error('Failed to delete procedure. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setNewProcedure(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditInputChange = (field, value) => {
    setEditingProcedure(prev => ({
      ...prev,
      [field]: value
    }));
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
          
          setNewProcedure(prev => ({
            ...prev,
            attachments: [...prev.attachments, attachment]
          }));
        };
        reader.readAsDataURL(file);
      });
    }

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
          
          setEditingProcedure(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), attachment]
          }));
        };
        reader.readAsDataURL(file);
      });
    }

    event.target.value = '';
  };

  const removeAttachment = (attachmentId, isEditing = false) => {
    if (isEditing) {
      setEditingProcedure(prev => ({
        ...prev,
        attachments: prev.attachments.filter(att => att.id !== attachmentId)
      }));
    } else {
      setNewProcedure(prev => ({
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

  const isUpcoming = (procedure) => {
    if (procedure.status !== 'scheduled') return false;
    const procedureDate = new Date(procedure.date);
    const now = new Date();
    return procedureDate > now;
  };

  const upcomingProcedures = procedures.filter(isUpcoming);

  const procedureTabs = [
    {
      key: 'timeline',
      label: 'Timeline',
      content: (
        <div className="space-y-4">
          {sortedProcedures.length > 0 ? (
            sortedProcedures.map((procedure) => (
              <HealthCard
                key={procedure.id}
                title={procedure.name}
                subtitle={procedure.description || 'No description available'}
                status={procedure.status}
                variant={getStatusVariant(procedure.status)}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewDetails(procedure)}
              >
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Status:</span>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(procedure.status)}
                      <Badge variant={getStatusVariant(procedure.status)} size="sm">
                        {procedure.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Type:</span>
                    <Badge variant={getTypeVariant(procedure.type)} size="sm">
                      {formatProcedureType(procedure.type)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-neutral-600">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>Date</span>
                    </div>
                    <span className="text-neutral-900">
                      {new Date(procedure.date).toLocaleDateString()}
                    </span>
                  </div>

                  {procedure.location && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-neutral-600">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        <span>Location</span>
                      </div>
                      <span className="text-neutral-900">{procedure.location}</span>
                    </div>
                  )}

                  {procedure.provider && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-neutral-600">
                        <UserIcon className="w-4 h-4 mr-1" />
                        <span>Provider</span>
                      </div>
                      <span className="text-neutral-900">{procedure.provider}</span>
                    </div>
                  )}

                  {isUpcoming(procedure) && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center space-x-2 text-info-600">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Upcoming procedure</span>
                      </div>
                    </div>
                  )}
                </div>
              </HealthCard>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">No procedures match your current filters.</div>
          )}
        </div>
      )
    },
    {
      key: 'by-status',
      label: 'By Status',
      content: (
        <div className="space-y-4">
          {/* Scheduled Procedures */}
          {groupedProcedures.scheduled.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 text-info-500 mr-2" />
                Scheduled ({groupedProcedures.scheduled.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedProcedures.scheduled.map((procedure) => (
                  <HealthCard
                    key={procedure.id}
                    title={procedure.name}
                    subtitle={new Date(procedure.date).toLocaleDateString()}
                    status={procedure.status}
                    variant="info"
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleViewDetails(procedure)}
                  >
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Type:</span>
                        <Badge variant={getTypeVariant(procedure.type)} size="sm">
                          {formatProcedureType(procedure.type)}
                        </Badge>
                      </div>
                      {procedure.location && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600">Location:</span>
                          <span className="text-neutral-900">{procedure.location}</span>
                        </div>
                      )}
                    </div>
                  </HealthCard>
                ))}
              </div>
            </div>
          )}

          {/* Completed Procedures */}
          {groupedProcedures.completed.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-success-500 mr-2" />
                Completed ({groupedProcedures.completed.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedProcedures.completed.map((procedure) => (
                  <HealthCard
                    key={procedure.id}
                    title={procedure.name}
                    subtitle={new Date(procedure.date).toLocaleDateString()}
                    status={procedure.status}
                    variant="success"
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleViewDetails(procedure)}
                  >
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Type:</span>
                        <Badge variant={getTypeVariant(procedure.type)} size="sm">
                          {formatProcedureType(procedure.type)}
                        </Badge>
                      </div>
                      {procedure.outcome && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600">Outcome:</span>
                          <span className="text-neutral-900">{procedure.outcome}</span>
                        </div>
                      )}
                    </div>
                  </HealthCard>
                ))}
              </div>
            </div>
          )}

          {/* Pending/Other Procedures */}
          {(groupedProcedures.pending.length > 0 || groupedProcedures.cancelled.length > 0) && (
            <div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <ClockIcon className="w-5 h-5 text-warning-500 mr-2" />
                Other ({groupedProcedures.pending.length + groupedProcedures.cancelled.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...groupedProcedures.pending, ...groupedProcedures.cancelled].map((procedure) => (
                  <HealthCard
                    key={procedure.id}
                    title={procedure.name}
                    subtitle={new Date(procedure.date).toLocaleDateString()}
                    status={procedure.status}
                    variant={getStatusVariant(procedure.status)}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleViewDetails(procedure)}
                  >
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Status:</span>
                        <Badge variant={getStatusVariant(procedure.status)} size="sm">
                          {procedure.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Type:</span>
                        <Badge variant={getTypeVariant(procedure.type)} size="sm">
                          {formatProcedureType(procedure.type)}
                        </Badge>
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
      key: 'by-type',
      label: 'By Type',
      content: (
        <div className="space-y-4">
          {Object.keys(groupedByType).length > 0 ? (
            Object.entries(groupedByType).map(([type, proceduresOfType]) => (
              <div key={type}>
                <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <span className="w-5 h-5 mr-2">
                    {type === 'surgical' ? '🏥' : type === 'diagnostic' ? '🔍' : 
                     type === 'therapeutic' ? '💊' : type === 'preventive' ? '🛡️' : 
                     type === 'emergency' ? '🚨' : '📋'}
                  </span>
                  {formatProcedureType(type)} ({proceduresOfType.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {proceduresOfType.map((procedure) => (
                    <HealthCard
                      key={procedure.id}
                      title={procedure.name}
                      subtitle={new Date(procedure.date).toLocaleDateString()}
                      status={procedure.status}
                      variant={getStatusVariant(procedure.status)}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleViewDetails(procedure)}
                    >
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">Status:</span>
                          <Badge variant={getStatusVariant(procedure.status)} size="sm">
                            {procedure.status}
                          </Badge>
                        </div>
                        {procedure.provider && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-600">Provider:</span>
                            <span className="text-neutral-900">{procedure.provider}</span>
                          </div>
                        )}
                      </div>
                    </HealthCard>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">No procedures match your current filters.</div>
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
                Medical Procedures
              </h1>
              <p className="text-neutral-600">
                Track your medical procedures and appointments
              </p>
            </div>
            <Button 
              variant="primary"
              onClick={handleAddProcedure}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Procedure</span>
            </Button>
          </div>
        </div>


        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search procedures..."
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="text-center">
            <div className="text-2xl font-bold text-success-600 mb-1">
              {groupedProcedures.completed.length}
            </div>
            <div className="text-sm text-neutral-600">Completed</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-info-600 mb-1">
              {groupedProcedures.scheduled.length}
            </div>
            <div className="text-sm text-neutral-600">Scheduled</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-warning-600 mb-1">
              {groupedProcedures.pending.length}
            </div>
            <div className="text-sm text-neutral-600">Pending</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-error-600 mb-1">
              {groupedProcedures.cancelled.length}
            </div>
            <div className="text-sm text-neutral-600">Cancelled</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {procedures.length}
            </div>
            <div className="text-sm text-neutral-600">Total</div>
          </Card>
        </div>

        {/* Procedures Content */}
        {filteredProcedures.length > 0 ? (
          <Tabs tabs={procedureTabs} variant="pills" />
        ) : (
          <Card className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardDocumentListIcon className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all'
                  ? 'No procedures match your filters' 
                  : 'No procedures recorded'
                }
              </h3>
              <p className="text-neutral-600 mb-4">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Medical procedures will appear here once they are added to your record.'
                }
              </p>
              {(!searchQuery && statusFilter === 'all' && typeFilter === 'all' && dateFilter === 'all') && (
                <Button variant="primary" onClick={handleAddProcedure}>
                  Add First Procedure
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Add Procedure Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Medical Procedure"
          size="xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Procedure Name *
                </label>
                <Input
                  value={newProcedure.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Colonoscopy, MRI Scan, Blood Test"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <Select
                  value={{ value: newProcedure.type, label: formatProcedureType(newProcedure.type) }}
                  onChange={(option) => handleInputChange('type', option.value)}
                  options={typeOptions.filter(o => o.value !== 'all')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={{ value: newProcedure.status, label: statusOptions.find(o => o.value === newProcedure.status)?.label }}
                  onChange={(option) => handleInputChange('status', option.value)}
                  options={statusOptions.filter(o => o.value !== 'all')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <Input
                  type="date"
                  value={newProcedure.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <Input
                  type="time"
                  value={newProcedure.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location/Facility
                </label>
                <Input
                  value={newProcedure.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., City Hospital, Imaging Center"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Healthcare Provider
                </label>
                <Input
                  value={newProcedure.provider}
                  onChange={(e) => handleInputChange('provider', e.target.value)}
                  placeholder="e.g., Dr. Smith, Radiology Dept"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <Input
                  value={newProcedure.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 30 minutes, 2 hours"
                />
              </div>

              {newProcedure.status === 'completed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Outcome
                  </label>
                  <Input
                    value={newProcedure.outcome}
                    onChange={(e) => handleInputChange('outcome', e.target.value)}
                    placeholder="e.g., Normal results, No abnormalities found"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newProcedure.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Brief description of the procedure..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newProcedure.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Additional notes, preparation instructions, follow-up care..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Procedure Documents & Images
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
                      id="procedure-file-upload"
                    />
                    <label htmlFor="procedure-file-upload" className="cursor-pointer">
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
                          Procedure reports, images, consent forms (PDF, PNG, JPG up to 10MB each)
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Uploaded Files List */}
                  {newProcedure.attachments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                      {newProcedure.attachments.map((attachment) => (
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
              <Button variant="primary" onClick={handleSaveProcedure} disabled={loading}>
                {loading ? 'Adding...' : 'Add Procedure'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Procedure Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={selectedProcedure?.name || 'Procedure Details'}
          size="lg"
        >
          {selectedProcedure && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Status</label>
                  <div className="mt-1 flex items-center space-x-2">
                    {getStatusIcon(selectedProcedure.status)}
                    <Badge variant={getStatusVariant(selectedProcedure.status)}>
                      {selectedProcedure.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Type</label>
                  <div className="mt-1">
                    <Badge variant={getTypeVariant(selectedProcedure.type)}>
                      {formatProcedureType(selectedProcedure.type)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-700">Description</label>
                <p className="mt-1 text-neutral-900">
                  {selectedProcedure.description || 'No description available'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Date</label>
                  <p className="mt-1 text-neutral-900">
                    {new Date(selectedProcedure.date).toLocaleDateString()}
                  </p>
                </div>
                {selectedProcedure.duration && (
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Duration</label>
                    <p className="mt-1 text-neutral-900">{selectedProcedure.duration}</p>
                  </div>
                )}
              </div>

              {selectedProcedure.location && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Location</label>
                  <p className="mt-1 text-neutral-900">{selectedProcedure.location}</p>
                </div>
              )}

              {selectedProcedure.provider && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Healthcare Provider</label>
                  <p className="mt-1 text-neutral-900">{selectedProcedure.provider}</p>
                </div>
              )}

              {selectedProcedure.outcome && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Outcome</label>
                  <p className="mt-1 text-neutral-900">{selectedProcedure.outcome}</p>
                </div>
              )}

              {selectedProcedure.notes && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Notes</label>
                  <p className="mt-1 text-neutral-900">{selectedProcedure.notes}</p>
                </div>
              )}

              {selectedProcedure.attachments && selectedProcedure.attachments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Attached Files</label>
                  <div className="mt-2 space-y-2">
                    {selectedProcedure.attachments.map((attachment) => (
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

              <div className="flex justify-between pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => handleDeleteProcedure(selectedProcedure.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Delete
                </Button>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                    Close
                  </Button>
                  <Button variant="primary" onClick={() => handleEditProcedure(selectedProcedure)}>
                    Edit Procedure
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Edit Procedure Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Medical Procedure"
          size="xl"
        >
          {editingProcedure && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Procedure Name *
                  </label>
                  <Input
                    value={editingProcedure.name}
                    onChange={(e) => handleEditInputChange('name', e.target.value)}
                    placeholder="e.g., Colonoscopy, MRI Scan, Blood Test"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <Select
                    value={{ value: editingProcedure.type, label: formatProcedureType(editingProcedure.type) }}
                    onChange={(option) => handleEditInputChange('type', option.value)}
                    options={typeOptions.filter(o => o.value !== 'all')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select
                    value={{ value: editingProcedure.status, label: statusOptions.find(o => o.value === editingProcedure.status)?.label }}
                    onChange={(option) => handleEditInputChange('status', option.value)}
                    options={statusOptions.filter(o => o.value !== 'all')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={editingProcedure.date}
                    onChange={(e) => handleEditInputChange('date', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <Input
                    type="time"
                    value={editingProcedure.time}
                    onChange={(e) => handleEditInputChange('time', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location/Facility
                  </label>
                  <Input
                    value={editingProcedure.location || ''}
                    onChange={(e) => handleEditInputChange('location', e.target.value)}
                    placeholder="e.g., City Hospital, Imaging Center"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Healthcare Provider
                  </label>
                  <Input
                    value={editingProcedure.provider || ''}
                    onChange={(e) => handleEditInputChange('provider', e.target.value)}
                    placeholder="e.g., Dr. Smith, Radiology Dept"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <Input
                    value={editingProcedure.duration || ''}
                    onChange={(e) => handleEditInputChange('duration', e.target.value)}
                    placeholder="e.g., 30 minutes, 2 hours"
                  />
                </div>

                {editingProcedure.status === 'completed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Outcome
                    </label>
                    <Input
                      value={editingProcedure.outcome || ''}
                      onChange={(e) => handleEditInputChange('outcome', e.target.value)}
                      placeholder="e.g., Normal results, No abnormalities found"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingProcedure.description || ''}
                    onChange={(e) => handleEditInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Brief description of the procedure..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editingProcedure.notes || ''}
                    onChange={(e) => handleEditInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Additional notes, preparation instructions, follow-up care..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Procedure Documents & Images
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
                        id="edit-procedure-file-upload"
                      />
                      <label htmlFor="edit-procedure-file-upload" className="cursor-pointer">
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
                            Procedure reports, images, consent forms (PDF, PNG, JPG up to 10MB each)
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Uploaded Files List */}
                    {editingProcedure.attachments && editingProcedure.attachments.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                        {editingProcedure.attachments.map((attachment) => (
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
                <Button variant="primary" onClick={handleUpdateProcedure} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Procedure'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
};

export default ProceduresPage;