// Basic API service tests
import apiService from '../api';

// Mock axios for testing
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    },
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }))
}));

describe('ApiService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should be defined', () => {
    expect(apiService).toBeDefined();
  });

  test('should have all required methods', () => {
    expect(typeof apiService.login).toBe('function');
    expect(typeof apiService.signUp).toBe('function');
    expect(typeof apiService.logout).toBe('function');
    expect(typeof apiService.getDashboard).toBe('function');
    expect(typeof apiService.getHealthData).toBe('function');
    expect(typeof apiService.getAlerts).toBe('function');
    expect(typeof apiService.getProviders).toBe('function');
  });

  test('should handle logout correctly', async () => {
    // Set a token in localStorage
    localStorage.setItem('fountain_token', 'test-token');
    
    // Call logout
    await apiService.logout();
    
    // Token should be removed
    expect(localStorage.getItem('fountain_token')).toBeNull();
  });
});

export default {};