import apiService from './api';
import { API_ENDPOINTS } from '../types/api';

/**
 * Production Request Service - Real API calls with mock fallback
 * 
 * This service attempts to use real backend endpoints first,
 * then falls back to mock data if the backend is unavailable.
 */
class ProductionRequestService {
  constructor() {
    this._endpointCache = new Map();
    this._checkEndpointAvailability = this._checkEndpointAvailability.bind(this);
  }

  /**
   * Get all requests with smart fallback
   */
  async getRequests(filters = {}) {
    try {
      // Check if endpoint is available (with caching)
      const endpointAvailable = await this._checkEndpointAvailability('/request-batches');
      
      if (!endpointAvailable) {
        console.warn('Request batches endpoint not available - backend implementation required');
        return this._getMockRequestsFallback(filters);
      }
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.search) params.append('q', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit || 20);
      
      const response = await apiService.get(`/request-batches?${params.toString()}`);
      
      // Handle different response formats
      const data = response.data.items || response.data.data || response.data || [];
      const total = response.data.total || response.data.count || data.length;
      
      return {
        data: Array.isArray(data) ? data : [],
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          total: total,
          totalPages: Math.ceil(total / (filters.limit || 20))
        },
        success: true,
        usingMockData: false
      };
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      
      // Check if it's a 404 (endpoint doesn't exist) vs other errors
      if (error.response?.status === 404) {
        // Cache that this endpoint doesn't exist
        this._endpointCache.set('/request-batches', { available: false, timestamp: Date.now() });
      }
      
      // Return mock data as fallback
      return this._getMockRequestsFallback(filters);
    }
  }

  /**
   * Get request by ID with fallback
   */
  async getRequestById(requestId) {
    try {
      const response = await apiService.get(API_ENDPOINTS.REQUEST_BATCH(requestId));
      return {
        data: response.data,
        success: true,
        usingMockData: false
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Request not found');
      }
      
      console.warn('Using mock request details as fallback');
      return {
        data: this._getMockRequestById(requestId),
        success: true,
        usingMockData: true
      };
    }
  }

  /**
   * Create a new request - always attempts real API first
   */
  async createRequest(requestData) {
    try {
      // Validate required fields
      this._validateRequestData(requestData);
      
      // Check endpoint availability
      const endpointAvailable = await this._checkEndpointAvailability('/request-batches', 'POST');
      
      if (!endpointAvailable) {
        // For create operations, we should inform the user
        throw new Error('Request creation endpoint not available. Please ensure backend is running.');
      }
      
      // Prepare payload
      const payload = {
        ...requestData,
        created_at: new Date().toISOString(),
        status: 'pending'
      };
      
      const response = await apiService.post('/request-batches', payload);
      
      return {
        data: response.data,
        success: true,
        message: 'Request created successfully'
      };
    } catch (error) {
      // For create operations, don't silently fallback to mock
      if (error.message.includes('endpoint not available')) {
        throw error;
      }
      
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        'Failed to create request. Please try again.'
      );
    }
  }

  /**
   * Get tracking history with fallback
   */
  async getTrackingHistory(requestId) {
    try {
      const timelineEndpoint = API_ENDPOINTS.REQUEST_BATCH_TIMELINE?.(requestId) || 
                              `/request-batches/${requestId}/timeline`;
      const response = await apiService.get(timelineEndpoint);
      
      return {
        data: response.data,
        success: true,
        usingMockData: false
      };
    } catch (error) {
      console.warn('Using mock tracking history as fallback');
      return {
        data: this._getMockTrackingHistory(requestId),
        success: true,
        usingMockData: true
      };
    }
  }

  /**
   * Cancel request
   */
  async cancelRequest(requestId, reason = '') {
    try {
      const payload = {
        reason: reason,
        cancelled_at: new Date().toISOString()
      };
      
      const response = await apiService.put(
        API_ENDPOINTS.REQUEST_BATCH_CANCEL(requestId),
        payload
      );
      
      return {
        data: response.data,
        success: true,
        message: 'Request cancelled successfully'
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 
        'Failed to cancel request'
      );
    }
  }

  /**
   * Get request statistics
   */
  async getRequestStats() {
    try {
      const response = await apiService.get('/request-batches/stats');
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      // Return zeros for production - no mock data
      return {
        data: {
          total: 0,
          pending: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0,
          avgCompletionTime: 'N/A',
          successRate: 0
        },
        success: true,
        usingMockData: false,
        message: 'Request statistics endpoint not yet implemented by backend'
      };
    }
  }

  // ============= Helper Methods =============

  /**
   * Check if an endpoint is available (with caching)
   */
  async _checkEndpointAvailability(endpoint, method = 'GET') {
    const cacheKey = `${method}:${endpoint}`;
    const cached = this._endpointCache.get(cacheKey);
    
    // Use cached result if it's less than 5 minutes old
    if (cached && (Date.now() - cached.timestamp) < 5 * 60 * 1000) {
      return cached.available;
    }
    
    try {
      // Try OPTIONS request first (least intrusive)
      await apiService.options(endpoint);
      this._endpointCache.set(cacheKey, { available: true, timestamp: Date.now() });
      return true;
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        this._endpointCache.set(cacheKey, { available: false, timestamp: Date.now() });
        return false;
      }
      // For other errors (network, auth, etc), assume endpoint exists
      return true;
    }
  }

  /**
   * Validate request data
   */
  _validateRequestData(data) {
    const required = ['requestType', 'provider', 'recordTypes'];
    const missing = required.filter(field => !data[field] || 
      (Array.isArray(data[field]) && data[field].length === 0)
    );
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Get all mock requests (for stats calculation)
   */
  _getAllMockRequests() {
    // Return empty array for production - no mock data
    return [];
  }

  /**
   * Get filtered mock requests
   */
  _getMockRequestsFallback(filters) {
    console.warn('Request batches endpoint not available - backend implementation required');
    
    // Return empty data for production
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      },
      success: true,
      usingMockData: false,
      message: 'Request management endpoints not yet implemented by backend'
    };
  }

  /**
   * Get mock request by ID
   */
  _getMockRequestById(requestId) {
    const mockRequest = this._getAllMockRequests().find(r => r.id === requestId);
    
    if (!mockRequest) {
      return {
        id: requestId,
        tracking_number: `REQ-${requestId}-2024`,
        status: 'pending',
        priority: 'medium',
        created_at: new Date().toISOString(),
        provider_name: 'Demo Hospital',
        record_types: ['lab_results'],
        progress: 0
      };
    }
    
    return {
      ...mockRequest,
      contact_info: {
        name: 'Medical Records Department',
        phone: '(555) 123-4567',
        email: 'records@provider.com'
      },
      timeline: this._getMockTrackingHistory(requestId)
    };
  }

  /**
   * Get mock tracking history
   */
  _getMockTrackingHistory(requestId) {
    return [
      {
        id: 1,
        event_type: 'created',
        timestamp: '2024-12-15T10:30:00Z',
        title: 'Request Created',
        description: 'Your request has been submitted',
        status: 'completed'
      },
      {
        id: 2,
        event_type: 'acknowledged',
        timestamp: '2024-12-15T14:22:00Z',
        title: 'Request Acknowledged',
        description: 'Provider has received your request',
        status: 'completed'
      },
      {
        id: 3,
        event_type: 'processing',
        timestamp: '2024-12-16T09:15:00Z',
        title: 'Processing Started',
        description: 'Medical records department is processing',
        status: 'completed'
      },
      {
        id: 4,
        event_type: 'in_review',
        timestamp: '2024-12-17T11:45:00Z',
        title: 'Under Review',
        description: 'Records are being reviewed',
        status: 'current'
      }
    ];
  }
}

// Export singleton instance
const productionRequestService = new ProductionRequestService();
export default productionRequestService;