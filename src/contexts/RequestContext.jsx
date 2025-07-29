import { createContext, useContext, useReducer } from 'react';

const RequestContext = createContext(null);

const initialState = {
  activeRequests: [],
  requestHistory: [],
  isLoading: false,
  error: null,
  currentRequest: null
};

const requestReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUESTS_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'FETCH_REQUESTS_SUCCESS':
      return {
        ...state,
        activeRequests: action.payload.active,
        requestHistory: action.payload.history,
        isLoading: false,
        error: null
      };
    case 'FETCH_REQUESTS_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case 'CREATE_REQUEST_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'CREATE_REQUEST_SUCCESS':
      return {
        ...state,
        activeRequests: [action.payload, ...state.activeRequests],
        currentRequest: action.payload,
        isLoading: false,
        error: null
      };
    case 'CREATE_REQUEST_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case 'UPDATE_REQUEST':
      return {
        ...state,
        activeRequests: state.activeRequests.map(request =>
          request.id === action.payload.id ? action.payload : request
        ),
        currentRequest: state.currentRequest?.id === action.payload.id ? action.payload : state.currentRequest
      };
    case 'SET_CURRENT_REQUEST':
      return {
        ...state,
        currentRequest: action.payload
      };
    case 'CLEAR_CURRENT_REQUEST':
      return {
        ...state,
        currentRequest: null
      };
    default:
      return state;
  }
};

export const RequestProvider = ({ children }) => {
  const [state, dispatch] = useReducer(requestReducer, initialState);

  const fetchRequests = async (token) => {
    dispatch({ type: 'FETCH_REQUESTS_START' });
    
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/request-batches', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      
      // Separate active and completed requests
      const active = data.filter(request => 
        ['PENDING', 'PROCESSING'].includes(request.status)
      );
      const history = data.filter(request => 
        ['COMPLETED', 'FAILED'].includes(request.status)
      );
      
      dispatch({
        type: 'FETCH_REQUESTS_SUCCESS',
        payload: { active, history }
      });

      return data;
    } catch (error) {
      dispatch({
        type: 'FETCH_REQUESTS_ERROR',
        payload: error.message
      });
      throw error;
    }
  };

  const createRequest = async (requestData, token) => {
    dispatch({ type: 'CREATE_REQUEST_START' });
    
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/request-batches', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to create request');
      }

      const data = await response.json();
      
      dispatch({
        type: 'CREATE_REQUEST_SUCCESS',
        payload: data
      });

      return data;
    } catch (error) {
      dispatch({
        type: 'CREATE_REQUEST_ERROR',
        payload: error.message
      });
      throw error;
    }
  };

  const getRequestById = async (batchId, token) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/request-batches/${batchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch request details');
      }

      const data = await response.json();
      
      dispatch({
        type: 'SET_CURRENT_REQUEST',
        payload: data
      });

      return data;
    } catch (error) {
      console.error('Failed to fetch request:', error);
      throw error;
    }
  };

  const updateRequestStatus = (updatedRequest) => {
    dispatch({
      type: 'UPDATE_REQUEST',
      payload: updatedRequest
    });
  };

  const clearCurrentRequest = () => {
    dispatch({ type: 'CLEAR_CURRENT_REQUEST' });
  };

  const value = {
    ...state,
    fetchRequests,
    createRequest,
    getRequestById,
    updateRequestStatus,
    clearCurrentRequest
  };

  return (
    <RequestContext.Provider value={value}>
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};