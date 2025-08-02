import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import { ActionTypes } from '../../context/AppContext';

import { 
  Button, 
  Card, 
  Badge, 
  Alert
} from '../../components/common';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  CalendarIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const RequestTrackingPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);

  useEffect(() => {
    // Get request details from backend
    const fetchRequestDetails = async () => {
      setLoading(true);
      try {
        // TODO: replace with real API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Using fake data for now
        const mockRequest = {
          id: requestId,
          trackingNumber: `REQ-${requestId?.toUpperCase()}`,
          title: "Medical Records Request",
          description: "Complete medical records from 2020-2024",
          status: "in_progress",
          priority: "medium",
          requestType: "complete_records",
          targetProvider: "City General Hospital",
          requestedBy: state.auth.user?.name || "Patient",
          createdDate: "2024-12-15T10:30:00Z",
          dueDate: "2024-12-25T17:00:00Z",
          estimatedCompletion: "3-5 business days",
          progress: 65,
          recordTypes: ["lab_results", "medications", "procedures", "visits"],
          contactInfo: {
            name: "Medical Records Department",
            phone: "(555) 123-4567",
            email: "records@citygeneral.com"
          },
          notes: "Urgent request for insurance claim processing",
          documents: [
            { name: "Authorization Form", status: "completed", date: "2024-12-15" },
            { name: "Identity Verification", status: "completed", date: "2024-12-16" },
            { name: "Records Processing", status: "in_progress", date: null },
            { name: "Quality Review", status: "pending", date: null },
            { name: "Final Delivery", status: "pending", date: null }
          ]
        };

        // Fake timeline data
        const mockHistory = [
          {
            id: 1,
            status: "submitted",
            title: "Request Submitted",
            description: "Your request has been submitted and assigned tracking number REQ-" + requestId?.toUpperCase(),
            timestamp: "2024-12-15T10:30:00Z",
            icon: DocumentIcon,
            variant: "info"
          },
          {
            id: 2,
            status: "acknowledged",
            title: "Request Acknowledged",
            description: "City General Hospital has received and acknowledged your request",
            timestamp: "2024-12-15T14:22:00Z",
            icon: CheckCircleIcon,
            variant: "success"
          },
          {
            id: 3,
            status: "processing",
            title: "Processing Started",
            description: "Medical records department has begun processing your request",
            timestamp: "2024-12-16T09:15:00Z",
            icon: ClockIcon,
            variant: "info"
          },
          {
            id: 4,
            status: "in_review",
            title: "Under Review",
            description: "Records are being compiled and reviewed for completeness",
            timestamp: "2024-12-17T11:45:00Z",
            icon: UserIcon,
            variant: "warning",
            current: true
          }
        ];

        setRequest(mockRequest);
        setTrackingHistory(mockHistory);
      } catch (error) {
        console.error('Error fetching request details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId, state.auth.user]);

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

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-success-500';
    if (progress >= 40) return 'bg-info-500';
    return 'bg-warning-500';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="content-container">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
            <div className="h-64 bg-neutral-200 rounded-xl"></div>
            <div className="h-96 bg-neutral-200 rounded-xl"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!request) {
    return (
      <AppLayout>
        <div className="content-container">
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Request Not Found</h2>
            <p className="text-neutral-600 mb-6">
              The request you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/requests')}>
              Back to Requests
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="content-container">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/requests')}
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Back to Requests</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                  Request Tracking
                </h1>
                <p className="text-neutral-600">
                  Track the progress of your medical records request
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-neutral-600">Tracking Number</div>
              <div className="font-mono text-lg font-bold text-primary-600">
                {request.trackingNumber}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side - main info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Request details card */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                    {request.title}
                  </h2>
                  <p className="text-neutral-600">{request.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusVariant(request.status)}>
                    {request.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant={getPriorityVariant(request.priority)}>
                    {request.priority} priority
                  </Badge>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-neutral-700">Overall Progress</span>
                  <span className="font-medium text-neutral-900">{request.progress}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(request.progress)}`}
                    style={{ width: `${request.progress}%` }}
                  />
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Request Type</label>
                  <p className="mt-1 text-neutral-900 capitalize">
                    {request.requestType.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Target Provider</label>
                  <p className="mt-1 text-neutral-900">{request.targetProvider}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Requested By</label>
                  <p className="mt-1 text-neutral-900">{request.requestedBy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Estimated Completion</label>
                  <p className="mt-1 text-neutral-900">{request.estimatedCompletion}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Created Date</label>
                  <p className="mt-1 text-neutral-900">
                    {formatDate(request.createdDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Due Date</label>
                  <p className="mt-1 text-neutral-900">
                    {formatDate(request.dueDate)}
                  </p>
                </div>
              </div>

              {/* What records are being requested */}
              <div className="mt-6">
                <label className="text-sm font-medium text-neutral-700 block mb-2">
                  Requested Record Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {request.recordTypes.map((type) => (
                    <Badge key={type} variant="info" size="sm">
                      {type.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Additional notes */}
              {request.notes && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-neutral-700 block mb-2">
                    Additional Notes
                  </label>
                  <p className="text-neutral-900 bg-neutral-50 p-3 rounded-lg">
                    {request.notes}
                  </p>
                </div>
              )}
            </Card>

            {/* Processing steps */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Processing Steps
              </h3>
              <div className="space-y-4">
                {request.documents.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg border">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      doc.status === 'completed' ? 'bg-success-100 text-success-600' :
                      doc.status === 'in_progress' ? 'bg-info-100 text-info-600' :
                      'bg-neutral-100 text-neutral-400'
                    }`}>
                      {doc.status === 'completed' ? (
                        <CheckCircleIcon className="w-5 h-5" />
                      ) : doc.status === 'in_progress' ? (
                        <ClockIcon className="w-5 h-5" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-current" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-neutral-900">{doc.name}</h4>
                        <Badge variant={getStatusVariant(doc.status)} size="sm">
                          {doc.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {doc.date && (
                        <p className="text-sm text-neutral-600 mt-1">
                          Completed on {new Date(doc.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Timeline of events */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Tracking History
              </h3>
              <div className="space-y-4">
                {trackingHistory.map((event, index) => {
                  const IconComponent = event.icon;
                  return (
                    <div key={event.id} className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        event.current ? 'bg-primary-100 text-primary-600 ring-4 ring-primary-50' :
                        event.variant === 'success' ? 'bg-success-100 text-success-600' :
                        event.variant === 'info' ? 'bg-info-100 text-info-600' :
                        event.variant === 'warning' ? 'bg-warning-100 text-warning-600' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${event.current ? 'text-primary-900' : 'text-neutral-900'}`}>
                            {event.title}
                          </h4>
                          <time className="text-sm text-neutral-600">
                            {formatDate(event.timestamp)}
                          </time>
                        </div>
                        <p className="text-neutral-600 mt-1">{event.description}</p>
                        {event.current && (
                          <Badge variant="primary" size="sm" className="mt-2">
                            Current Status
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right side - actions */}
          <div className="space-y-6">
            {/* Who to contact */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-neutral-400" />
                  <div>
                    <div className="font-medium text-neutral-900">
                      {request.contactInfo.name}
                    </div>
                    <div className="text-sm text-neutral-600">Department</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-neutral-400" />
                  <div>
                    <div className="font-medium text-neutral-900">
                      {request.contactInfo.phone}
                    </div>
                    <div className="text-sm text-neutral-600">Phone</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <InformationCircleIcon className="w-5 h-5 text-neutral-400" />
                  <div>
                    <div className="font-medium text-neutral-900">
                      {request.contactInfo.email}
                    </div>
                    <div className="text-sm text-neutral-600">Email</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action buttons */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button variant="primary" className="w-full">
                  Download Progress Report
                </Button>
                <Button variant="outline" className="w-full">
                  Contact Provider
                </Button>
                {request.status === 'pending' && (
                  <Button variant="error" className="w-full">
                    Cancel Request
                  </Button>
                )}
              </div>
            </Card>

            {/* Help info */}
            <Alert
              variant="info"
              title="Need Help?"
              message="If you have questions about your request or need to make changes, please contact the medical records department using the information provided."
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default RequestTrackingPage;