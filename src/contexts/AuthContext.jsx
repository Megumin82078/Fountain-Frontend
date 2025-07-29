import { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('fountain_token');
    const user = localStorage.getItem('fountain_user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            token,
            user: parsedUser
          }
        });
      } catch (error) {
        localStorage.removeItem('fountain_token');
        localStorage.removeItem('fountain_user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // TODO: Replace with actual API call - for now simulate API response
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Mock successful login response
      const mockResponse = {
        access_token: 'mock_access_token_' + Date.now(),
        user: {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: credentials.email,
          role: 'patient',
          user_type: 'individual'
        }
      };
      
      localStorage.setItem('fountain_token', mockResponse.access_token);
      localStorage.setItem('fountain_user', JSON.stringify(mockResponse.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token: mockResponse.access_token,
          user: mockResponse.user
        }
      });

      return mockResponse;
    } catch (error) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload: error.message
      });
      throw error;
    }
  };

  const signup = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // TODO: Replace with actual API call - for now simulate API response
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      // Mock successful signup response
      const mockResponse = {
        access_token: 'mock_access_token_' + Date.now(),
        user: {
          id: Date.now(),
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          role: userData.role,
          user_type: userData.user_type
        }
      };
      
      localStorage.setItem('fountain_token', mockResponse.access_token);
      localStorage.setItem('fountain_user', JSON.stringify(mockResponse.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token: mockResponse.access_token,
          user: mockResponse.user
        }
      });

      return mockResponse;
    } catch (error) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload: error.message
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('fountain_token');
    localStorage.removeItem('fountain_user');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};