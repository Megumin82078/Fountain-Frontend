import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './AuthContext';
import { HealthDataProvider } from './HealthDataContext';
import { RequestProvider } from './RequestContext';
import { UIProvider } from './UIContext';
import { NotificationProvider } from '../components/shared/NotificationSystem/NotificationSystem';
import ToastContainer from '../components/shared/Toast/ToastContainer';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const AppProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <UIProvider>
          <AuthProvider>
            <HealthDataProvider>
              <RequestProvider>
                {children}
                <ToastContainer />
              </RequestProvider>
            </HealthDataProvider>
          </AuthProvider>
        </UIProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
};

export default AppProvider;